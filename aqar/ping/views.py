from django.http import HttpResponse

def ping(request):
    return HttpResponse("OK", content_type="text/plain")