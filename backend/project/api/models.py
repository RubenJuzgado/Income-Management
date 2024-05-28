from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.constraints import UniqueConstraint
from cryptography.fernet import Fernet
from django.conf import settings

# Create your models here.
class User(models.Model):
    email = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=20)
    surname = models.CharField(max_length=50)
    password = models.CharField(max_length=255)

    
    # Esta función es para comprobar que la contraseña cifrada es igual a la contraseña que se le pasa
    def check_password(self, password):
        f = Fernet(settings.ENCRYPTION_KEY)
        decrypted = f.decrypt(self.password.encode()).decode()
        return decrypted == password
    
    def encrypt_password(password):
        f = Fernet(settings.ENCRYPTION_KEY)
        encrypted = f.encrypt(password.encode())
        return encrypted

# Esta clase es para los contenedores de dinero, se correspondería con las distintas cuentas bancarias que tuviera el usuario
class Container(models.Model):
    name = models.CharField(max_length=50)
    money = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# Esta clase es para los objetivos de ahorro, se correspondería con los distintos objetivos de ahorro que tuviera el usuario
class Savings_Goal(models.Model):
    name = models.CharField(max_length=50)
    goal = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# Esta clase es para determinar el porcentaje de las cuentas que se destinará a cada objetivo de ahorro
class Savings(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['container', 'savings_goal'], name='unique_container_savings_goal')
        ]
    quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    container = models.ForeignKey(Container, on_delete=models.CASCADE)
    savings_goal = models.ForeignKey(Savings_Goal, on_delete=models.CASCADE)