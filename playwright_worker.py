"""
playwright_worker.py — постоянный фоновый поток для работы с Playwright (sync API) из Streamlit.

Тот же файл, что и в crosspost/ (см. память по кросспостингу) — Streamlit выполняет
каждую перерисовку страницы в НОВОМ потоке, а Playwright sync API жёстко привязывает
браузер к одному потоку (иначе падает `greenlet.error: cannot switch to a different
thread`). Решение — один постоянный поток-воркер, всё общение с браузером идёт через
очередь команд.
"""

from __future__ import annotations

import queue
import threading
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class _Job:
    func: Callable
    args: tuple
    kwargs: dict
    result_q: "queue.Queue[tuple[bool, Any]]" = field(default_factory=queue.Queue)


class PlaywrightWorker:
    def __init__(self):
        self._jobs: "queue.Queue[_Job | None]" = queue.Queue()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self):
        while True:
            job = self._jobs.get()
            if job is None:
                break
            try:
                result = job.func(*job.args, **job.kwargs)
                job.result_q.put((True, result))
            except Exception as e:  # noqa: BLE001
                job.result_q.put((False, e))

    def call(self, func: Callable, *args, **kwargs) -> Any:
        job = _Job(func, args, kwargs)
        self._jobs.put(job)
        ok, value = job.result_q.get()
        if not ok:
            raise value
        return value

    def stop(self):
        self._jobs.put(None)
