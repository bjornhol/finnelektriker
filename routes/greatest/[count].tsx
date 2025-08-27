import { Handlers, PageProps } from "$fresh/server.ts";

interface BrregEnhet {
  navn: string;
  organisasjonsnummer: string;
  forretningsadresse: {
    kommune: string;
    postnummer: string;
    adresse: string[];
  };
  organisasjonsform: {
    kode: string;
  };
  antallAnsatte: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render({ results: [], query: "" });
  },
  async POST(req, ctx) {
    const url = new URL(ctx.url);
    const municipality = url.searchParams.get("municipality") || "";

    console.log("Searching for municipality:", municipality);

    const params = new URLSearchParams({
      naeringskode: "43.210",
      fraAntallAnsatte: "5",
      konkurs: "false",
      underAvvikling: "false",
      underKonkursbehandling: "false",
      underTvangsavviklingEllerTvangsopplosning: "false",
      size: `${ctx.params.count || 5}`,
      sort: "antallAnsatte,DESC",
      "forretningsadresse.kommune": municipality,
    });

    const response = await fetch(
      "https://data.brreg.no/enhetsregisteret/api/enheter?" + params.toString()
    );

    const data = await response.json();

    const suggestions: BrregEnhet[] = data._embedded?.enheter || [];

    return ctx.render({ results: suggestions, query: municipality });
  },
};

export default function Greatest(props: PageProps<{ results: BrregEnhet[]; query: string }>) {
  const { results: suggestions, query } = props.data;

  console.log("Suggestions:", suggestions);

  return (
    <div>
      <form method="POST">
        <input type="text" name="municipality" value={query} class="border p-1" placeholder="Din kommune" />
        <button type="submit" class="ml-1 px-2 py-1 bg-gray-100 border">
          Søk
        </button>
      </form>
      <ul>
        {suggestions.map((item) => <li key={item.navn}>{item.navn}</li>)}
      </ul>
    </div>
  );
}