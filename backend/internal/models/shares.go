package models

import (
	"database/sql"
	"time"
)

type Share struct {
	ID           int
	SnippetID    int
	OwnerID      int
	SharedWithID int
	Created      time.Time
}

type ShareModelInterface interface {
	Insert(snippetID, ownerID, sharedWithID int) error
	GetSharedWithUser(userID int) ([]Snippet, error)
}

type ShareModel struct {
	DB *sql.DB
}

func (m *ShareModel) Insert(snippetID, ownerID, sharedWithID int) error {
	stmt := `INSERT INTO snippet_shares (snippet_id, owner_id, shared_with_id, created) 
			VALUES(?, ?, ?, UTC_TIMESTAMP())`

	_, err := m.DB.Exec(stmt, snippetID, ownerID, sharedWithID)
	return err
}

func (m *ShareModel) GetSharedWithUser(userID int) ([]Snippet, error) {
	stmt := `SELECT s.id, s.title, s.content, s.created, s.expires 
			FROM snippets s
			INNER JOIN snippet_shares ss ON s.id = ss.snippet_id
			WHERE ss.shared_with_id = ?
			AND s.expires > UTC_TIMESTAMP()`

	rows, err := m.DB.Query(stmt, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var snippets []Snippet

	for rows.Next() {
		var s Snippet
		err := rows.Scan(&s.ID, &s.Title, &s.Content, &s.Created, &s.Expires)
		if err != nil {
			return nil, err
		}
		snippets = append(snippets, s)
	}

	return snippets, rows.Err()
}