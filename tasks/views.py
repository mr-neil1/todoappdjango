from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Task

# Create your views here.

def task_list(request):
    tasks = Task.objects.all()
    # Calcul des statistiques
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    urgent_tasks = tasks.filter(priority='urgente').count()
    
    context = {
        'tasks': tasks,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'urgent_tasks': urgent_tasks,
    }
    return render(request, 'tasks/task_list.html', context)

def add_task(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        priority = request.POST.get('priority', 'moyenne')
        
        Task.objects.create(
            title=title,
            description=description,
            priority=priority
        )
        return redirect('task_list')
    
    return render(request, 'tasks/add_task.html')

def toggle_task(request, task_id):
    task = Task.objects.get(id=task_id)
    task.completed = not task.completed
    task.save()
    return JsonResponse({'completed': task.completed})

def delete_task(request, task_id):
    if request.method == 'POST':
        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            return JsonResponse({'success': True})
        except Task.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Tâche non trouvée'}, status=404)
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

