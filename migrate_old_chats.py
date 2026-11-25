import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import transaction

from chat.models import Conversation, ConversationMessage, Message

# 1. Pair each AI answer with the question right before it
pairs = []
used = set()

for a in Message.objects.filter(is_ai_generated=True).order_by("id"):
    q = (
        Message.objects.filter(ticket_id=a.ticket_id, id__lt=a.id)
        .order_by("-id")
        .first()
    )
    if q and not q.is_ai_generated and q.sender_id == a.sender_id and q.id not in used:
        pairs.append((q, a))
        used.add(q.id)

paired = {m.id for pair in pairs for m in pair}
print("Pairs found:", len(pairs))

# 2. Group the pairs by (ticket, user)
groups = {}
for q, a in pairs:
    groups.setdefault((q.ticket_id, q.sender_id), []).append((q, a))

# 3. Copy into the new tables and move the old rows out of the support thread
with transaction.atomic():
    for (ticket_id, user_id), items in groups.items():
        first = items[0][0]

        conv = Conversation.objects.filter(
            user_id=user_id, ticket_id=ticket_id
        ).first()
        if conv is None:
            conv = Conversation.objects.create(
                user=first.sender,
                ticket=first.ticket,
                title=first.ticket.title[:60],
            )

        if conv.messages.exists():
            continue  # already copied, safe to run twice

        for q, a in items:
            for msg, role in ((q, "USER"), (a, "ASSISTANT")):
                cm = ConversationMessage.objects.create(
                    conversation=conv, role=role, content=msg.content
                )
                ConversationMessage.objects.filter(pk=cm.pk).update(
                    created_at=msg.created_at
                )

        Conversation.objects.filter(pk=conv.pk).update(
            created_at=items[0][0].created_at,
            updated_at=items[-1][1].created_at,
        )

    Message.objects.filter(id__in=paired).update(channel="AI")

print("Done:", len(groups), "chats,", len(paired), "messages moved")