import express from "express"
import userRouter from "./src/routes/userRoutes"
import categoryRoute from "./src/routes/categoryRoutes"
import eventRoute from "./src/routes/eventRoutes"
import ticketRoute from "./src/routes/ticketRoutes"
import orderRoute from "./src/routes/orderRoute"
import reviewRoute from "./src/routes/reviewroutes"
import authRoutes from "./src/routes/authRoute"

const app = express()
app.use(express.json())

app.use("/user",userRouter)
app.use("/category",categoryRoute)
app.use("/event",eventRoute)
app.use("/ticket",ticketRoute)
app.use("/order",orderRoute)
app.use("/review",reviewRoute)
app.use("/api",authRoutes)

app.listen(3000, () => {
    console.log("Serveri po punon ne protin 3000")
})
