import '../css/Main.css'

function Main({ children }) {
  return (
    <main id="main-content" className="site-main">
      {children}
    </main>
  )
}

export default Main
