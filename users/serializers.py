from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import password_validation
from rest_framework import serializers

from users.repositories.user_repository import UserRepository
from users.services.auth_service import register_customer


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        value = value.strip()
        if UserRepository.get_by_username(value):
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        value = value.strip()
        if UserRepository.get_by_email(value):
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages))
        return value

    def create(self, validated_data):
        try:
            return register_customer(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
            )
        except ValueError as error:
            raise serializers.ValidationError({"detail": str(error)})