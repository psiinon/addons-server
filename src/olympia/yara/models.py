from django.db import models
from django_extensions.db.fields.json import JSONField

from olympia.amo.models import ModelBase
from olympia.files.models import FileUpload


class YaraResult(ModelBase):
    upload = models.OneToOneField(FileUpload,
                                  related_name='yara_results',
                                  on_delete=models.SET_NULL,
                                  null=True)
    has_matches = models.NullBooleanField()
    matches = JSONField(default=[])
    version = models.OneToOneField('versions.Version',
                                   related_name='yara_results',
                                   on_delete=models.CASCADE,
                                   null=True)

    class Meta:
        db_table = 'yara_results'
        indexes = [
            models.Index(fields=('has_matches',)),
        ]

    def add_match(self, rule, tags=None, meta=None):
        self.matches.append({
            'rule': rule,
            'tags': tags or [],
            'meta': meta or {},
        })
        self.has_matches = True

    def save(self, *args, **kwargs):
        if self.has_matches is None:
            self.has_matches = bool(self.matches)
        super().save(*args, **kwargs)

    @property
    def matched_rules(self):
        return sorted({match['rule'] for match in self.matches})
