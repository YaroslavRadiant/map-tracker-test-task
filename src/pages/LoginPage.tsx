import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStores } from "../providers/useStores";

export const LoginPage = observer(() => {
  const { authStore } = useStores();
  const [keyValue, setKeyValue] = useState(authStore.apiKey);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const normalized = keyValue.trim();

    if (!normalized) {
      setError("Введіть ключ доступу");
      return;
    }

    const success = authStore.login(normalized);

    if (!success) {
      setError("Невірний формат ключа");
      return;
    }

    setError("");
    navigate("/");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Paper sx={{ p: 4, width: "100%" }}>
          <Typography variant="h5" mb={2}>
            Авторизація
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="API Key"
              value={keyValue}
              onChange={(e) => {
                setKeyValue(e.target.value);
                if (error) setError("");
              }}
              error={Boolean(error)}
              helperText={error || "Формат: base64 від 'access:<число>'"}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Alert severity="info">
              <Typography variant="body2" sx={{ mb: 1 }}>
                Приклад:
              </Typography>
              <Typography sx={{ wordBreak: "break-all" }}>
                YWNjZXNzOjQ4Mjkx
              </Typography>
            </Alert>

            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Увійти
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
});
