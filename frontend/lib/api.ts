const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://cognicare-ai.onrender.com";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}

// Progress
export async function getProgress(userId: number) {
  return request(`/api/progress/${userId}`);
}

// Difficulty performance
export async function getDifficultyPerformance(userId: number) {
  return request(`/api/difficulty/performance/${userId}`);
}

// Get difficulty
export async function getDifficulty(
  userId: number,
  gameName: string
) {
  return request(
    `/api/difficulty/${userId}/${encodeURIComponent(gameName)}`
  );
}
// Submit game score
export async function submitGameScore(
  userId: number,
  gameName: string,
  score: number,
  accuracy: number,
  timeTaken: number
) {
  return request("/api/games/submit", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      game_name: gameName,
      score: score,
      accuracy: accuracy,
      time_taken: timeTaken,
    }),
  });
}

// Predict next difficulty
export async function predictDifficulty(
  accuracy: number,
  score: number,
  timeTaken: number
) {
  return request<{ predicted_difficulty: string }>("/api/difficulty/predict", {
    method: "POST",
    body: JSON.stringify({
      accuracy: accuracy,
      score: score,
      time_taken: timeTaken,
    }),
  });
}
// Set difficulty
export async function setDifficulty(
  userId: number,
  gameName: string,
  difficultyLevel: string
) {
  return request("/api/difficulty/set", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      game_name: gameName,
      difficulty_level: difficultyLevel,
    }),
  });
}

// Login
type LoginResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
};

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  return request<LoginResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// Register
type RegisterResponse = {
  message: string;
};

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  return request<RegisterResponse>("/api/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role: "patient",
    }),
  });
}