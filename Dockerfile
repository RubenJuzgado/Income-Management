FROM node:20 AS frontend

# Set the working directory
WORKDIR /app

COPY /backend/project/frontend .

RUN npm install
RUN npm run build

FROM python:3.12-slim

# Set the working directory
WORKDIR /IncomeManagement

# Set the environment variables required by Django
ENV PYTHONUNBUFFERED=1

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the project
COPY . .

# Copy node_modules from the frontend container
WORKDIR /IncomeManagement/backend/project/frontend

COPY --from=frontend /app/node_modules node_modules

# Copy dist from the frontend container
COPY --from=frontend /app/dist dist

# Expose the port
EXPOSE 8000

WORKDIR /IncomeManagement


# Command to run the application
CMD ["python", "create-env.py"]