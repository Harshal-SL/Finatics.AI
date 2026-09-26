import axios from 'axios';
import API_BASE_URL from './api';

const BASE_URL = `${API_BASE_URL}/goals`;

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
