from django.db import models
from django.utils import timezone

# Create your models here.

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('basse', 'Basse'),
        ('moyenne', 'Moyenne'),
        ('urgente', 'Urgente'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='moyenne')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
