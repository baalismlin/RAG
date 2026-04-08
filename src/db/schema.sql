CREATE TABLE IF NOT EXISTS symbols (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  symbol_type TEXT        NOT NULL,
  language    TEXT        NOT NULL,
  file_path   TEXT        NOT NULL,
  start_line  INTEGER     NOT NULL,
  end_line    INTEGER     NOT NULL,
  content     TEXT        NOT NULL,
  signature   TEXT,
  indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symbols_name       ON symbols (name);
CREATE INDEX IF NOT EXISTS idx_symbols_name_lower ON symbols (lower(name));
CREATE INDEX IF NOT EXISTS idx_symbols_file_path  ON symbols (file_path);
CREATE INDEX IF NOT EXISTS idx_symbols_type       ON symbols (symbol_type);

CREATE TABLE IF NOT EXISTS symbol_relations (
  id              SERIAL  PRIMARY KEY,
  from_symbol_id  TEXT    NOT NULL REFERENCES symbols(id) ON DELETE CASCADE,
  to_symbol_name  TEXT    NOT NULL,
  to_symbol_id    TEXT    REFERENCES symbols(id) ON DELETE SET NULL,
  relation_type   TEXT    NOT NULL,
  file_path       TEXT    NOT NULL,
  line_number     INTEGER
);

CREATE INDEX IF NOT EXISTS idx_rel_from      ON symbol_relations (from_symbol_id);
CREATE INDEX IF NOT EXISTS idx_rel_to_id     ON symbol_relations (to_symbol_id);
CREATE INDEX IF NOT EXISTS idx_rel_to_name   ON symbol_relations (to_symbol_name);
CREATE INDEX IF NOT EXISTS idx_rel_type      ON symbol_relations (relation_type);
