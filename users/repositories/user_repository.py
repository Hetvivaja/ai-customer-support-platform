from users.models import User


class UserRepository:

    @staticmethod
    def create(username, email, password, role=User.Role.CUSTOMER):
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
        )

    @staticmethod
    def get_by_id(user_id):
        return User.objects.filter(id=user_id).first()

    @staticmethod
    def get_by_username(username):
        return User.objects.filter(username=username).first()

    @staticmethod
    def get_by_email(email):
        return User.objects.filter(email__iexact=email).first()

    @staticmethod
    def get_all():
        return User.objects.all()

    @staticmethod
    def update(user, **kwargs):
        password = kwargs.pop("password", None)

        for field, value in kwargs.items():
            if field in {"id", "pk", "password", "is_superuser"}:
                raise ValueError(f"Cannot update field: {field}")

            if field not in {"username", "email", "first_name",
                             "last_name", "role", "is_active"}:
                raise ValueError(f"Unsupported user field: {field}")

            setattr(user, field, value)

        if password:
            user.set_password(password)

        user.save()
        return user

    @staticmethod
    def delete(user):
        user.delete()

    @staticmethod
    def delete_by_id(user_id):
        user = UserRepository.get_by_id(user_id)
        if user is None:
            return False
        
        user.delete()
        return True
    
