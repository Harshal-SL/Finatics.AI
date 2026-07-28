import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '') + '/goals';

export async function fetchGoals(userId) {
  const res = await axios.get(`${BASE_URL}`, { params: { userId } });
  return res.data.data;
}

export async function analyzeAndSaveGoal(goalData) {
  const res = await axios.post(`${BASE_URL}`, goalData);
  return res.data.data;
}

export async function updateGoal(goalId, updateData) {
  const res = await axios.put(`${BASE_URL}/${goalId}`, updateData);
  return res.data.data;
}

export async function deleteGoal(goalId) {
  const res = await axios.delete(`${BASE_URL}/${goalId}`);
  return res.data;
}
