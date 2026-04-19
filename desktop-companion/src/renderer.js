const jobList = document.getElementById('job-list');

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

function renderJobs(jobs) {
  if (!jobs.length) {
    jobList.innerHTML = '<p class="empty">No share jobs yet.</p>';
    return;
  }

  jobList.innerHTML = jobs
    .map(
      (job) => `
        <article class="job-card">
          <div class="job-head">
            <strong>${job.kind === 'text' ? 'Text share' : 'File share'}</strong>
            <span>${formatTime(job.createdAt)}</span>
          </div>
          <p class="job-token">Code: ${job.token}</p>
          <a class="job-link" href="${job.shareUrl}">${job.shareUrl}</a>
          <p class="job-status">Status: ${job.status}</p>
        </article>
      `
    )
    .join('');
}

async function loadJobs() {
  try {
    const response = await fetch('http://127.0.0.1:45721/jobs');
    const data = await response.json();
    renderJobs(data.jobs || []);
  } catch (error) {
    console.error(error);
  }
}

window.desktopCompanion.onJobQueued(() => {
  loadJobs();
});

loadJobs();
