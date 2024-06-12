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

# Expose the port
EXPOSE 8000


# Command to run the application
CMD ["python", "create-env.py"]