FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements and install
COPY "Study Group Matcher/requirements.txt" ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY "Study Group Matcher/." ./

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "4"]
