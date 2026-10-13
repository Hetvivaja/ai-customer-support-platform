from django.db import transaction
from users.models import User
from users.repositories.user_repository import UserRepository


@transaction.atomic
def register_customer(username, email, password):
    if UserRepository.get_by_username(username):
        raise ValueError("Username already exists")

    return UserRepository.create(
        username=username,
        email=email,
        password=password,
        role=User.Role.CUSTOMER
    )
def Get_all_customers():
    return UserRepository.get_all()

def find_customer(user_id):
    return UserRepository.get_by_id(user_id)


def change_customer_email(user_id, new_email):
    user = UserRepository.get_by_id(user_id)

    if user is None:
        return None

    return UserRepository.update(user, email=new_email)