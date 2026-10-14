import { createSlice } from "@reduxjs/toolkit";


const initialProduct = {
    products: []
}

const productSlice = createSlice({
    name: 'products',
    initialState: initialProduct,
    reducers: {
        setProducts : (state, action)=>{
            return { products: action.payload}
        },
        addToProduct : (state, action)=>{
            state.products.push(action.payload)
        },
        editProduct: (state, action)=>{
            const updateProduct = action.payload
            const prodIndex = state.products.findIndex(prod => prod?._id?.toString() === updateProduct?._id?.toString())
            if (prodIndex >= 0) {
                state.products[prodIndex] = updateProduct
            }
        },
        deleteProduct: (state, action)=>{
            const product = action.payload
            return {
                products: state.products.filter(
                    prod => prod?._id?.toString() !== product?._id?.toString(),
                ),
            }
        },
        clearProducts: ()=>{
            return { products: []}
        }
    }
})

export const { 
    deleteProduct,
    addToProduct,
    editProduct,
    setProducts,
    clearProducts
} = productSlice.actions


export default productSlice.reducer