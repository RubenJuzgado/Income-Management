import decimal
from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from cryptography.fernet import Fernet
from django.conf import settings

from . models import *

ENCRYPTION_KEY = settings.ENCRYPTION_KEY

# Register view
@require_POST
def register(request):
    # Parse request body
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    surname = data.get("surname")

    # Check if all form fields are filled
    if not email or not password or not name or not surname:
        return JsonResponse({"detail": "Please fill all form fields"}, status=400)
    
    # Check if email is already in use
    if User.objects.filter(email=email).exists():
        return JsonResponse({"detail": "Email already in use"}, status=400)
    
    # Check password requirements
    if not any(char.isdigit() for char in password):
        return JsonResponse({"detail": "Password must contain at least one digit"}, status=400)
    if not any(char.isupper() for char in password):
        return JsonResponse({"detail": "Password must contain at least one uppercase letter"}, status=400)
    if not any(char.islower() for char in password):
        return JsonResponse({"detail": "Password must contain at least one lowercase letter"}, status=400)
    if not any(char in "!@#$%^&*()-_+=[]{}|;:,.<>?/" for char in password):
        return JsonResponse({"detail": "Password must contain at least one special character"}, status=400)
    if len(password) < 11:
        return JsonResponse({"detail": "Password must contain at least 11 characters"}, status=400)
    
    # Encrypt password
    password = User.encrypt_password(password).decode()
    # Create and save user
    user = User.objects.create(email=email, password=password, name=name, surname=surname)
    user.save()
    return JsonResponse({"detail": "Successfully registered", "user": {"email": user.email, "name": user.name, "surname": user.surname}}, status=200)

# Login view
@require_POST
def login(request):
    # Parse request body
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")

    # Check if email and password are provided
    if not email or not password:
        return JsonResponse({"detail": "Please fill all form fields"}, status=400)
    
    # Retrieve user by email
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "Wrong credentials"}, status=400)
    
    # Check if user exists and password is correct
    f = Fernet(ENCRYPTION_KEY)
    if not user.check_password(password):
        return JsonResponse({"detail": "Wrong credentials"}, status=400)
    
    return JsonResponse({"detail": "Succesfully logged in", "user": {"email": user.email, "name": user.name, "surname": user.surname}}, status=200)

# Create container view
@require_POST
def create_container(request):
    # Parse request body
    data = json.loads(request.body)
    name = data.get("name")
    money = data.get("money")
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if all form fields are filled and user exists
    if not name or not money:
        return JsonResponse({"detail": "Please fill all form fields"}, status=400)
    
    # Check if container name is already in use
    if Container.objects.filter(name=name, user=user.id).exists():
        return JsonResponse({"detail": "Container name already in use"}, status=400)
    
    # Create and save container
    container = Container.objects.create(name=name, money=money, user=user)
    container.save()
    return JsonResponse({"detail": "Container successfully created", "container": {"name": container.name, "money": container.money}})

# Get containers view
@require_POST
def get_containers(request):
    # Parse request body
    data = json.loads(request.body)
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except Exception as e:
        print(e)
        return JsonResponse({"detail": "An error occurred. Refresh the page"}, status=400)
    
    # Retrieve containers for the user
    containers = Container.objects.filter(user=user.id).values()
    containers = list(containers)
    
    # Add unavailable money for each container
    for container in containers:
        container["unavailable_money"] = get_unavailable_money(Container.objects.get(name=container["name"], user=user))
    
    return JsonResponse({"detail": "Containers successfully obtained", "containers": containers})

# Update container view
@require_POST
def update_container(request):
    # Parse request body
    data = json.loads(request.body)
    originalName = data.get("originalName")
    name = data.get("name")
    money = decimal.Decimal(data.get("money"))
    email = data.get("email")
    user = User.objects.get(email=email)
    
    # Check if all form fields are filled and user exists
    if not name or not money or not user or not originalName:
        return JsonResponse({"detail": "Please fill all form fields"}, status=400)
    
    # Check if original container exists
    if not Container.objects.filter(name=originalName, user=user.id).exists():
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if new container name is already in use
    if Container.objects.filter(name=name, user=user.id).exists() and name != originalName:
        return JsonResponse({"detail": "Container new name already in use"}, status=400)
    
    container = Container.objects.get(name=originalName, user=user)
    
    # Check if container has enough money for savings goals
    unavailable_money = get_unavailable_money(container)
    if money < unavailable_money:
        return JsonResponse({"detail": "The container wouldn't have enough money for the current savings goals. Edit the savings goals first"}, status=400)
    
    # Update container and save
    container.money = money
    container.name = name
    container.save()
    
    return JsonResponse({"detail": "Container successfully updated", "container": {"name": container.name, "money": container.money}})

# Delete container view
@require_POST
def delete_container(request):
    # Parse request body
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if container name and user exist
    if not name or not user:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    container = Container.objects.get(name=name, user=user.id)
    
    # Check if container exists
    if container is None:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Delete associated savings and container
    savings =  Savings.objects.filter(container=container)
    for saving in savings:
        saving.delete()
    container.delete()
    
    return JsonResponse({"detail": "Container successfully deleted", "container": {"name": name}})

# Get savings goals view
@require_POST
def get_savings_goals(request):
    # Parse request body
    data = json.loads(request.body)
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except:
        user = None
    
    # Check if user exists
    if user is None:
        return JsonResponse({"detail": "An error occurred. Refresh the page"}, status=400)
    
    # Retrieve savings goals for the user
    savings_goals = Savings_Goal.objects.filter(user=user.id).values()
    savings_goals = list(savings_goals)
    
    # Add current amount for each savings goal
    for savings_goal in savings_goals:
        savings_goal["currentAmount"] = round(get_current_amount_goal(savings_goal["id"]), 2) # Round to two decimal places
    
    return JsonResponse({"detail": "Savings goals successfully obtained", "savings_goals": savings_goals})

# Helper function to calculate current amount for a savings goal
def get_current_amount_goal(savings_goal_id):
    savings = Savings.objects.filter(savings_goal=savings_goal_id).values()
    savings = list(savings)
    current_amount = 0
    for saving in savings:
        quantity = saving["quantity"]
        quantity = quantity if quantity else 0
        current_amount += quantity
    return current_amount

# Create savings goal view
@require_POST
def create_savings_goal(request):
    # Parse request body
    data = json.loads(request.body)
    name = data.get("name")
    goal = float((data.get("goal"))) if data.get("goal") else None
    email = data.get("email")
    rows = data.get("rows")

    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if name is provided
    if name is None:
        return JsonResponse({"detail": "Please fill the name field"}, status=400)
    
    if goal and goal < 1:
        return JsonResponse({"detail": "Please fill a goal greater than 0 or leave it in blank"}, status=400)
    
    # Check if savings goal name is already in use
    if Savings_Goal.objects.filter(name=name, user=user.id).exists():
        return JsonResponse({"detail": "Savings goal name already in use"}, status=400)
    
    # Create and save savings goal
    if goal:
        savings_goal = Savings_Goal.objects.create(name=name, goal=goal, user=user)
    else:
        savings_goal = Savings_Goal.objects.create(name=name, user=user)
    savings_goal.save()
    
    try:
        for row in rows:
            try:
                container = Container.objects.get(name=row["container"], user=user)
            except:
                return JsonResponse({"detail": "The container does not exist"}, status=400)
            quantity = decimal.Decimal(row["quantity"]) if row["quantity"] else None
            
            # Check if quantity is provided
            if quantity is not None:
                # Check if container has enough money for the quantity
                if not check_container_money(container, quantity):
                    savings_goal.delete()
                    return JsonResponse({"detail": "The container " + container.name + " does not have enough money"}, status=400)
                
                quantity = quantity
                savings = Savings.objects.create(quantity=quantity, container=container, savings_goal=savings_goal)
            else:
                savings_goal.delete()
                return JsonResponse({"detail": "Please fill the quantity in the row " + str(row.id + 1)}, status=400)
            
            savings.save()
            container.save()

        return JsonResponse({"detail": "Savings goal created successfully", "savings_goal": {"name": savings_goal.name, "goal": savings_goal.goal}})
    except Exception as e:
        savings_goal.delete()
        print(e)
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)

# Helper function to check if container has enough money for a quantity
def check_container_money(container, quantity, original_quantity = 0):
    available_money = container.money - get_unavailable_money(container)
    return quantity <= available_money + original_quantity

# Delete savings goal view
@require_POST
def delete_savings_goal(request):
    # Parse request body
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if name is provided
    if name is None:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    savings_goal = Savings_Goal.objects.get(name=name, user=user)
    
    # Check if savings goal exists
    if savings_goal is None:
        return JsonResponse({"detail": "The savings goal does not exist"}, status=400)
    
    savings = Savings.objects.filter(savings_goal=savings_goal)
    
    # Delete associated savings and savings goal
    for saving in savings:
        saving.delete()
    savings_goal.delete()
    
    return JsonResponse({"detail": "Savings goal successfully deleted", "savings_goal": {"name": name}})

# Update savings goal view
@require_POST
def update_savings_goal(request):
    # Parse request body
    data = json.loads(request.body)
    originalName = data.get("originalName")
    originalGoal = data.get("originalGoal")
    originalRows = data.get("originalRows")
    name = data.get("name")
    goal = data.get("goal")
    email = data.get("email")
    rows = data.get("rows")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if name is provided
    if name is None:
        return JsonResponse({"detail": "Please fill the name of the savings goal"}, status=400)
    
    # Check if original savings goal exists
    if not Savings_Goal.objects.filter(name=originalName, user=user.id).exists():
        return JsonResponse({"detail": "The savings goal does not exist"}, status=400)
    
    # Check if new savings goal name is already in use
    if Savings_Goal.objects.filter(name=name, user=user.id).exists() and name != originalName:
        return JsonResponse({"detail": "Savings goal new name already in use"}, status=400)
    
    savings_goal = Savings_Goal.objects.get(name=originalName, user=user)
    savings_goal.name = name
    savings_goal.goal = goal
    savings_goal.save()
    
    try:
        containers_in_rows = []
        original_containers = [row["container"] for row in originalRows]
        
        for row in rows:
            try:
                container = Container.objects.get(name=row["container"], user=user)
            except:
                return JsonResponse({"detail": "The container does not exist"}, status=400)
            
            containers_in_rows.append(container.name)
            quantity = decimal.Decimal(row["quantity"]) if row["quantity"] else None
            original_quantity = get_original_quantity(originalRows, container.name)
            
            if quantity is not None:
                # Check if container has enough money for the quantity
                if not check_container_money(container, quantity, original_quantity):
                    return JsonResponse({"detail": "The container " + container.name + " does not have enough money"}, status=400)
                
                if Savings.objects.filter(container=container, savings_goal=savings_goal).exists():
                    savings = Savings.objects.get(container=container, savings_goal=savings_goal)
                    savings.quantity = quantity
                else:
                    savings = Savings.objects.create(quantity=quantity, container=container, savings_goal=savings_goal)
            else:
                return JsonResponse({"detail": "Please fill the quantity in the row " + str(row.id + 1)}, status=400)
            
            savings.save()
            container.save()
        
        for container in original_containers:
            if container not in containers_in_rows:
                container = Container.objects.get(name=container, user=user)
                savings = Savings.objects.get(container=container, savings_goal=savings_goal)
                savings.delete()

        return JsonResponse({"detail": "Savings goal updated successfully", "savings_goal": {"name": savings_goal.name, "goal": savings_goal.goal}})
    except Exception as e:
        print(e.with_traceback(e.__traceback__))
        # Revert changes
        savings_goal.name = originalName
        savings_goal.goal = originalGoal
        savings_goal.save()
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)

# Helper function to get original quantity for a container in the original rows
def get_original_quantity(originalRows, container_name):
    for row in originalRows:
        if row["container"] == container_name:
            return decimal.Decimal(row["quantity"])
    return 0

# Complete savings goal view
@require_POST
def complete_savings_goal(request):
    # Parse request body
    data = json.loads(request.body)
    name = data.get("name")
    email = data.get("email")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if name is provided
    if name is None:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    savings_goal = Savings_Goal.objects.get(name=name, user=user)
    
    # Check if savings goal exists
    if savings_goal is None:
        return JsonResponse({"detail": "The savings goal does not exist"}, status=400)
    
    savings = Savings.objects.filter(savings_goal=savings_goal)
    
    # Check if savings goal has been completed
    if get_current_amount_goal(savings_goal.id) < savings_goal.goal:
        return JsonResponse({"detail": "The savings goal has not been completed yet"}, status=400)
    
    check_goal = 0
    
    for saving in savings:
        if saving.quantity:
            container = saving.container
            
            # Check if goal is not exceeded
            if check_goal + saving.quantity > savings_goal.goal:
                saving.quantity = savings_goal.goal - check_goal
            
            container.money -= saving.quantity
            check_goal += saving.quantity
            container.save()
        
        saving.delete()
    
    savings_goal.delete()
    
    return JsonResponse({"detail": "Savings goal successfully completed", "savings_goal": {"name": name, "goal": savings_goal.goal}})

# Helper function to calculate unavailable money for a container
def get_unavailable_money(container):
    savings = Savings.objects.filter(container=container.id)
    unavailable_money = 0
    
    for saving in savings:
        unavailable_money += saving.quantity
    
    return unavailable_money

# Get savings view
@require_POST
def get_savings(request):
    # Parse request body
    data = json.loads(request.body)
    email = data.get("email")
    savings_goal_name = data.get("name")
    
    try:
        user = User.objects.get(email=email)
    except:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    # Check if savings goal name is provided
    if savings_goal_name is None:
        return JsonResponse({"detail": "An error occurred. Reload and try again"}, status=400)
    
    savings_goal = Savings_Goal.objects.get(name=savings_goal_name, user=user)
    
    # Check if savings goal exists
    if savings_goal is None:
        return JsonResponse({"detail": "The savings goal does not exist"}, status=400)
    
    savings_list = Savings.objects.filter(savings_goal=savings_goal).values()
    savings_list = list(savings_list)
    savings = []
    
    for saving in savings_list:
        container = Container.objects.get(id=saving["container_id"])
        savings.append({"id": len(savings),"container": container.name, "quantity": saving["quantity"]})
    
    return JsonResponse({"detail": "Savings successfully obtained", "savings": savings})