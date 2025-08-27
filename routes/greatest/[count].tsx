import { Handlers, PageProps } from "$fresh/server.ts";

interface BrregEnhet {
  navn: string;
  organisasjonsnummer: string;
  telefon: string;
  epostadresse: string;
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

function getWebAddressFromEmail(email: string): string | undefined {
  if (!email || typeof email !== 'string') {
    return undefined;
  }
  
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1 || atIndex === email.length - 1) {
    return undefined;
  }
  
  return `https://${email.substring(atIndex + 1).toLowerCase().trim()}`;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render({ results: [], query: "" });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const municipality = form.get("municipality")?.toString() || '';

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



export default function Greatest(
  props: PageProps<{ results: BrregEnhet[]; query: string }>
) {
  const { results: suggestions, query } = props.data;

  return (
    <>
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <form method="POST">
            <input
              type="text"
              name="municipality"
              value={query}
              class="border p-1"
              placeholder="Din kommune"
            />
            <button type="submit" class="ml-1 px-2 py-1 bg-gray-100 border">
              Søk
            </button>
          </form>
        </div>
      </div>
      <div class="px-6 py-6 mx-auto">
        <div class="max-w-screen-md mx-auto flex flex-col">
          <ul class="divide-y divide-gray-200">
            {suggestions.map((item) => (
              <li class="p-4" key={item.navn}>
                <p class="text-lg font-medium text-gray-900">
                    {item.epostadresse && (
                      <a class="text-blue-500 hover:underline" href={getWebAddressFromEmail(item.epostadresse)} target="_blank" rel="noopener noreferrer">
                        {item.navn}
                      </a>
                    )}
                    {!item.epostadresse && (
                      <>{item.navn}</>
                    )}
                </p>
                <span class="text-sm">
                  {item.forretningsadresse.adresse},{" "}
                  {item.forretningsadresse.postnummer}{" "}
                  {item.forretningsadresse.kommune}
                </span>
                {item.telefon && (<span class="py-2 flex items-center">
                  <img src="/phone.svg" width="24" height="24" />
                  <span class="px-2 font-bold">{item.telefon}</span>
                </span>)}
                {item.epostadresse && (<span class="py-2 flex items-center">
                  <img src="/email.svg" width="24" height="24" />
                  <span class="px-2 font-bold">{item.epostadresse}</span>
                </span>)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
