export const commonStyles = {
  container: {
    background: "#E9E9E9",
    minHeight: "100vh",
    padding: "2rem",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  button: {
    primary: {
      background: "#000",
      color: "#fff",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "background-color 0.2s ease",
    },
    secondary: {
      background: "#f5f5f5",
      color: "#333",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "1rem",
      transition: "background-color 0.2s ease",
    },
  },
  link: {
    color: "#000000",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    margin: "0 0 1rem 0",
    color: "#000000",
  },
  subtitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    margin: "0 0 1.5rem 0",
    color: "#000000",
  },
  text: {
    regular: {
      fontSize: "1rem",
      color: "#565656",
    },
    small: {
      fontSize: "0.9rem",
      color: "#565656",
    },
  },
} as const;
