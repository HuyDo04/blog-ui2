import { getCurrentUser } from "@/services/auth.service";
import { createAsyncThunk } from "@reduxjs/toolkit";

const fetchCurrentUser = createAsyncThunk("auth/getCurrentUser",
    async () => {
        const user = await getCurrentUser();
        return user;
    }
);

export default fetchCurrentUser;