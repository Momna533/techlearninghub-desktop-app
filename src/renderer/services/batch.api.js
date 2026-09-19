export async function listBatches(filters = {}) {
  return window.desktop.batches.list(filters);
}

export async function getBatch(id) {
  return window.desktop.batches.get(id);
}

export async function createBatch(batch) {
  return window.desktop.batches.create(batch);
}

export async function updateBatch(id, batch) {
  return window.desktop.batches.update({
    id,
    batch,
  });
}

export async function listBatchCourses() {
  return window.desktop.batches.courses();
}

export async function listBatchTrainers() {
  return window.desktop.batches.trainers();
}
