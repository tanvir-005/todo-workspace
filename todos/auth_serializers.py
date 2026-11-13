from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import UserProfile
from django.db import transaction

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=150)
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):
        name = validated_data.pop('name')
        email = validated_data['email']

        # Determine whether this is the first registered user.
        is_first_user = not User.objects.exists()

        base_username = email.split('@')[0]
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        first_name = name.split()[0]
        last_name = ' '.join(name.split()[1:])

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )

        UserProfile.objects.create(
            user=user,
            role=(
                UserProfile.Role.ADMIN
                if is_first_user
                else UserProfile.Role.MEMBER
            ),
        )

        return user