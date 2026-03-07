PRAGMA foreign_keys = OFF;

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  users_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  birthdate TEXT NOT NULL
);

-- -----------------------------------------------------
-- Table exercises
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  exercises_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- -----------------------------------------------------
-- Table cardio_records
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cardio_records (
  cardio_records_id INTEGER PRIMARY KEY AUTOINCREMENT,
  distance INTEGER NOT NULL,
  time TEXT,
  date TEXT,
  users_id INTEGER NOT NULL,
  exercises_id INTEGER NOT NULL,
  FOREIGN KEY (users_id) REFERENCES users(users_id),
  FOREIGN KEY (exercises_id) REFERENCES exercises(exercises_id)
);

-- -----------------------------------------------------
-- Table muscles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS muscles (
  muscles_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- -----------------------------------------------------
-- Table muscles_exercises
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS muscles_exercises (
  muscles_exercises_id INTEGER PRIMARY KEY AUTOINCREMENT,
  muscles_id INTEGER NOT NULL,
  exercises_id INTEGER NOT NULL,
  FOREIGN KEY (muscles_id) REFERENCES muscles(muscles_id),
  FOREIGN KEY (exercises_id) REFERENCES exercises(exercises_id)
);

-- -----------------------------------------------------
-- Table weight_records
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS weight_records (
  weight_records_id INTEGER PRIMARY KEY AUTOINCREMENT,
  weight INTEGER NOT NULL,
  reps INTEGER,
  sets INTEGER,
  date TEXT NOT NULL,
  bodyweight INTEGER,
  users_id INTEGER NOT NULL,
  exercises_id INTEGER NOT NULL,
  FOREIGN KEY (users_id) REFERENCES users(users_id),
  FOREIGN KEY (exercises_id) REFERENCES exercises(exercises_id)
);

-- -----------------------------------------------------
-- Table workouts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
  workouts_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  duration TEXT,
  rating INTEGER,
  users_id INTEGER NOT NULL,
  FOREIGN KEY (users_id) REFERENCES users(users_id)
);

-- -----------------------------------------------------
-- Table workouts_exercises
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts_exercises (
  workouts_exercises_id INTEGER PRIMARY KEY AUTOINCREMENT,
  workouts_id INTEGER NOT NULL,
  exercises_id INTEGER NOT NULL,
  FOREIGN KEY (workouts_id) REFERENCES workouts(workouts_id),
  FOREIGN KEY (exercises_id) REFERENCES exercises(exercises_id)
);

PRAGMA foreign_keys = ON;