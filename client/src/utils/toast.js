import toast from "react-hot-toast"

export const toastWarn = (msg)=>{
  toast(msg, {
    icon: "⚠️",
    style: {
      borderRadius: '10px',
      background: '#fff7ed', // light orange background
      color: '#c2410c',      // dark orange text
    },
  })
}