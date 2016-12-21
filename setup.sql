CREATE TABLE	tasks (
	id SERIAL PRIMARY KEY NOT NULL,
	task VARCHAR(256) UNIQUE,
	active BOOLEAN,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);