import React from "react";
import ZoomFlight from "./ZoomFlight";
import ZoomFlightBack from "./ZoomFlightBack";
import { DECKS } from "../constants";

export default function Flights({ flight, onForwardDone, flightBack, onBackDone }){
  return (
    <>
      {flight && (
        <ZoomFlight
          fromEl={flight.fromEl} r={flight.r} card={flight.card}
          reversed={flight.reversed} deckCfg={DECKS[flight.deckId]}
          duration={420} onDone={onForwardDone}
        />
      )}
      {flightBack && (
        <ZoomFlightBack
          toEl={flightBack.toEl} r={flightBack.r} card={flightBack.card}
          reversed={flightBack.reversed} deckCfg={DECKS[flightBack.deckId]}
          duration={420} onDone={onBackDone}
        />
      )}
    </>
  );
}
