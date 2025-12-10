from django.db import models

# Create your models here.
class Document(models.Model):
    title = models.CharField(max_length=200)
    desc = models.TextField()
    url = models.TextField()
    status = models.CharField(max_length=50, default='Healthy')
    date = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=100, null=True, default="General")


    def __str__(self):
        return self.title

class DocumentScan(models.Model):
    CHANGE_LEVEL_CHOICES = [
        ('No Change', 'No Change'),
        ('Low', 'Low'),
        ('Major', 'Major'),
        ('Critical', 'Critical'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    changeLevel = models.CharField(max_length=50, choices=CHANGE_LEVEL_CHOICES, default='No Change')
    changes = models.BooleanField(default=False)
    changeSummary = models.TextField(null=True, blank=True)
    currentSummary = models.TextField(null=True, blank=True)
    additions = models.TextField(null=True, blank=True)
    deletions = models.TextField(null=True, blank=True)
    modifications = models.TextField(null=True, blank=True)
    rawData = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Scan of {self.document.title} on {self.date}"