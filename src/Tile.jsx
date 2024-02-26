export function Tile({ content: Content, flip, state, index}) {
  if (state === "matched") {
    return (
    <Matched className={index === 1 ? "flex justify-center h-14 w-14 text-[#fca6b150]" : "flex justify-center h-14 w-14 text-[#80a2ff69]"}>
      <Content
        style={{
          display: "inline-block",
          width: "80%",
          height: "100%",
          verticalAlign: "top",
          margin: "auto",
        }}
      />
    </Matched>
    )
  } else {
    return (//add the classnames for the flip animation based on state
      <div className="cardWrapper">
      <div className="relative card h-14 w-14">
        {/* conditional styling of card themes for players one and two */}
        <Back
          className={index === 1 ? state === "flipped" ? "bg-red-300 card-back flipped" : "bg-red-300 card-back" : state === "flipped" ? "bg-[#80a2ffd7] card-back flipped" : "bg-[#80a2ffd7] card-back"}
          flip={flip}
        />
        <Front className={index === 1 ? state === "flipped" ? "bg-red-500 card-front flipped" : "bg-red-500 card-front" : state === "flipped" ? "bg-blue-500 card-front flipped" : "bg-blue-500 card-front"}>
          <Content
            style={{
              display: "inline-block",
              width: "80%",
              height: "100%",
              verticalAlign: "top",
              color: "white",
              margin: "auto",
            }}
          />
        </Front>
      </div>
      </div>
    )
  }
}

function Back({ className, flip }) {
  return <div onClick={flip} className={className}></div>;
}

function Front({ className, children }) {
  return <div className={className}>{children}</div>;
}

function Matched({ className, children }) {
  return <div className={className}>{children}</div>;
}
