import '../css/Main.css'

function Main() {
  return (
    <main className="site-main">
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero__accent" aria-hidden="true"></span>
        <h1 id="hero-title" className="hero__title">
          The Real Purpose of Being an Artist
        </h1>
        <p className="hero__description">
          A space to explore acting, develop your craft, and discover your
          artistic voice.
        </p>
      </section>
    </main>
  )
}

export default Main
