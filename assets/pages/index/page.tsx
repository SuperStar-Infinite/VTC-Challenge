import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

type NoteStatus = "new" | "todo" | "done";

type Note = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: NoteStatus;
};

type View = "register" | "confirm-info" | "login" | "notes";

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 16px;
  background: #0f172a;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

const Card = styled.div`
  width: 100%;
  max-width: 960px;
  background: #020617;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.8);
  border: 1px solid #1e293b;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  color: #9ca3af;
  font-size: 14px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid ${({ active }) => (active ? "#38bdf8" : "#1e293b")};
  background: ${({ active }) => (active ? "rgba(56, 189, 248, 0.15)" : "transparent")};
  color: ${({ active }) => (active ? "#e0f2fe" : "#d1d5db")};
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: #38bdf8;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #e5e7eb;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background: #020617;
  color: #e5e7eb;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "ghost" }>`
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid
    ${({ variant }) =>
      variant === "secondary" ? "#374151" : variant === "ghost" ? "transparent" : "#0ea5e9"};
  background:
    ${({ variant }) =>
      variant === "secondary"
        ? "#020617"
        : variant === "ghost"
        ? "transparent"
        : "linear-gradient(90deg, #06b6d4, #0ea5e9)"};
  color: ${({ variant }) => (variant === "ghost" ? "#9ca3af" : "#0b1120")};
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ErrorText = styled.p`
  margin: 4px 0 0;
  color: #f97373;
  font-size: 13px;
`;

const InfoText = styled.p`
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 13px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #e5e7eb;
`;

const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.4fr);
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const NoteCard = styled.div`
  border-radius: 12px;
  border: 1px solid #1e293b;
  padding: 10px 12px;
  background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), #020617 40%);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoteTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const NoteTitle = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #e5e7eb;
`;

const NoteMeta = styled.div`
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: #9ca3af;
`;

const Tag = styled.span<{ tone?: "blue" | "amber" | "green" }>`
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ tone }) =>
      tone === "amber" ? "#facc15" : tone === "green" ? "#4ade80" : "#38bdf8"};
  color: ${({ tone }) =>
    tone === "amber" ? "#facc15" : tone === "green" ? "#4ade80" : "#7dd3fc"};
  background: rgba(15, 23, 42, 0.8);
`;

const NoteBody = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #d1d5db;
`;

async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data && (data as any).error) || response.statusText);
  }

  return (await response.json()) as T;
}

const IndexPage: React.FC = () => {
  const [view, setView] = useState<View>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterStatus, setFilterStatus] = useState<"" | NoteStatus>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newNote, setNewNote] = useState<{
    title: string;
    content: string;
    category: string;
    status: NoteStatus;
  }>({
    title: "",
    content: "",
    category: "",
    status: "new",
  });

  // Detect confirmation token in URL and call backend if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setView("confirm-info");
      setLoading(true);
      setError(null);
      setInfo(null);
      api<{ message: string }>(`/api/confirm/${encodeURIComponent(token)}`)
        .then((data) => {
          setInfo(data.message || "Account confirmed. You can now login.");
        })
        .catch((e) => {
          setError(e.message || "Failed to confirm account");
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Check if already logged in
    api<{ email: string; confirmed: boolean }>("/api/me")
      .then((me) => {
        if (me && me.confirmed) {
          setView("notes");
          loadNotes();
        }
      })
      .catch(() => {
        // not logged in, stay on register
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory) params.set("category", filterCategory);

      const data = await api<Note[]>(`/api/notes?${params.toString()}`);
      setNotes(data);
    } catch (e: any) {
      setError(e.message || "Failed to load notes");
    }
  };

  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => set.add(n.category));
    return Array.from(set).sort();
  }, [notes]);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await api<{ message: string }>("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setView("confirm-info");
      setInfo(
        "Registration successful. A confirmation email has been written to var/emails. Open the latest file, copy the link and paste it in your browser to confirm."
      );
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      }).then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error((data && (data as any).message) || "Login failed");
        }
        return response;
      });

      const me = await api<{ email: string; confirmed: boolean }>("/api/me");
      if (!me.confirmed) {
        setError("Your account is not confirmed yet.");
        setView("confirm-info");
        return;
      }

      setView("notes");
      await loadNotes();
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setView("login");
    setNotes([]);
  };

  const handleCreateNote = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api<Note>("/api/notes", {
        method: "POST",
        body: JSON.stringify(newNote),
      });
      setNewNote({ title: "", content: "", category: "", status: "new" });
      await loadNotes();
    } catch (e: any) {
      setError(e.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id: number, patch: Partial<Note>) => {
    setError(null);
    try {
      await api<Note>(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      await loadNotes();
    } catch (e: any) {
      setError(e.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async (id: number) => {
    setError(null);
    try {
      await api(`/api/notes/${id}`, {
        method: "DELETE",
      });
      await loadNotes();
    } catch (e: any) {
      setError(e.message || "Failed to delete note");
    }
  };

  const renderAuthContent = () => {
    if (view === "register" || view === "confirm-info") {
      return (
        <>
          <SectionTitle>Create your account</SectionTitle>
          <Subtitle>
            Register with an email and password. We will generate a confirmation email file for you.
          </Subtitle>
          <Form onSubmit={handleRegister}>
            <Label>
              Email
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Label>
            <Label>
              Password
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Label>
            <ButtonRow>
              <Button type="submit" disabled={loading}>
                {loading ? "Working..." : "Register"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setView("login")}
                disabled={loading}
              >
                I already have an account
              </Button>
            </ButtonRow>
          </Form>
        </>
      );
    }

    return (
      <>
        <SectionTitle>Login</SectionTitle>
        <Subtitle>Login with your confirmed account to manage your notes.</Subtitle>
        <Form onSubmit={handleLogin}>
          <Label>
            Email
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Label>
          <Label>
            Password
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Label>
          <ButtonRow>
            <Button type="submit" disabled={loading}>
              {loading ? "Working..." : "Login"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setView("register")}
              disabled={loading}
            >
              Create new account
            </Button>
          </ButtonRow>
        </Form>
      </>
    );
  };

  const renderNotesContent = () => (
    <TwoColumn>
      <div>
        <SectionTitle>Notes</SectionTitle>
        <Subtitle>
          Search, filter by status and category, update status or delete notes you no longer need.
        </Subtitle>
        <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 8 }}>
          <Input
            placeholder="Search in title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={loadNotes}>
            Apply
          </Button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "" | NoteStatus)}
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="todo">To do</option>
            <option value="done">Done</option>
          </Select>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {distinctCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <NotesList>
          {notes.map((note) => (
            <NoteCard key={note.id}>
              <NoteTitleRow>
                <NoteTitle>{note.title}</NoteTitle>
                <NoteMeta>
                  <Tag tone="blue">{note.category}</Tag>
                  <Tag
                    tone={note.status === "done" ? "green" : note.status === "todo" ? "amber" : "blue"}
                  >
                    {note.status.toUpperCase()}
                  </Tag>
                </NoteMeta>
              </NoteTitleRow>
              <NoteBody>{note.content}</NoteBody>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Select
                  value={note.status}
                  onChange={(e) =>
                    handleUpdateNote(note.id, { status: e.target.value as NoteStatus })
                  }
                >
                  <option value="new">New</option>
                  <option value="todo">To do</option>
                  <option value="done">Done</option>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete
                </Button>
              </div>
            </NoteCard>
          ))}
          {notes.length === 0 && (
            <InfoText>No notes yet. Create your first one on the right.</InfoText>
          )}
        </NotesList>
      </div>
      <div>
        <SectionTitle>New note</SectionTitle>
        <Subtitle>Capture a thought with a title, content, category and status.</Subtitle>
        <Form onSubmit={handleCreateNote}>
          <Label>
            Title
            <Input
              required
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
          </Label>
          <Label>
            Content
            <Textarea
              required
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
          </Label>
          <Label>
            Category
            <Input
              required
              value={newNote.category}
              onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
            />
          </Label>
          <Label>
            Status
            <Select
              value={newNote.status}
              onChange={(e) =>
                setNewNote({ ...newNote, status: e.target.value as NoteStatus })
              }
            >
              <option value="new">New</option>
              <option value="todo">To do</option>
              <option value="done">Done</option>
            </Select>
          </Label>
          <ButtonRow>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create note"}
            </Button>
          </ButtonRow>
        </Form>
      </div>
    </TwoColumn>
  );

  return (
    <PageWrapper>
      <Card>
        <Header>
          <div>
            <Title>VTC Notes Challenge</Title>
            <Subtitle>
              Full-stack demo: register, confirm via email file, log in and manage filtered notes.
            </Subtitle>
          </div>
          {view === "notes" && (
            <Button type="button" variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Header>

        <Tabs>
          <TabButton
            type="button"
            active={view === "register" || view === "confirm-info"}
            onClick={() => setView("register")}
          >
            1. Register
          </TabButton>
          <TabButton
            type="button"
            active={view === "confirm-info"}
            onClick={() => setView("confirm-info")}
          >
            2. Confirm email
          </TabButton>
          <TabButton
            type="button"
            active={view === "login"}
            onClick={() => setView("login")}
          >
            3. Login
          </TabButton>
          <TabButton
            type="button"
            active={view === "notes"}
            onClick={() => setView("notes")}
          >
            4. Notes
          </TabButton>
        </Tabs>

        {error && <ErrorText>{error}</ErrorText>}
        {info && <InfoText>{info}</InfoText>}

        {view === "notes" ? renderNotesContent() : renderAuthContent()}
      </Card>
    </PageWrapper>
  );
};

export { IndexPage };
