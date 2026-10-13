from rest_framework import serializers
from .models import User
from users.services.auth_service import register_customer


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        try:
            return register_customer(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
            )
        except ValueError as error:
            raise serializers.ValidationError({
                "username": str(error)
            })