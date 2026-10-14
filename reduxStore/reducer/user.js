import { createSlice } from "@reduxjs/toolkit";

const initialUser = {
    email: '',
    _id: '',
    name: ''
}

const userSlice = createSlice({
    name: 'user',
    initialState: initialUser,
    reducers: {
        setUser: (state, action)=>{
            return { ...action.payload }
        },
        clearUser: ()=>{
            return initialUser
        }
    }
})

export const { 
    setUser,
    clearUser
} = userSlice.actions


export default userSlice.reducer