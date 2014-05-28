from datetime import datetime

from apscheduler.scheduler import Scheduler

import fetchandstore

sched = Scheduler()
sched.start()

sched.add_interval_job(fetchandstore.thewholeshebang, minutes=1)
s
while True:
    pass

                           
       

