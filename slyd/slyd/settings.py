"""Scrapy settings"""
from os.path import join, dirname

EXTENSIONS = {
    'scrapy.contrib.logstats.LogStats': None,
    'scrapy.webservice.WebService': None,
    'scrapy.telnet.TelnetConsole': None,
    'scrapy.contrib.throttle.AutoThrottle': None
}

LOG_LEVEL = 'DEBUG'

# location of slybot projects - assumes a subdir per project
DATA_DIR = join(dirname(dirname(__file__)), 'data')
SPEC_DATA_DIR = join(DATA_DIR, 'projects')

SPEC_FACTORY = {
    'PROJECT_SPEC': 'slyd.projectspec.ProjectSpec',
    'PROJECT_MANAGER': 'slyd.projects.ProjectsManager',
    'PARAMS': {
        'location': SPEC_DATA_DIR,
    },
    'CAPABILITIES': {
        'version_control': False,
        'create_projects': True,
        'delete_projects': True,
        'rename_projects': True,
        'deploy_projects': False,
    }
}


# recommended for development - use scrapy to cache http responses
# add them to local_settings.py
# HTTPCACHE_ENABLED = True
# HTTPCACHE_DIR = join(DATA_DIR, 'cache')

try:
    from local_settings import *
except ImportError:
    pass
