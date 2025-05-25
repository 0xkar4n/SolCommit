

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Missing wallet address' }), { status: 400 });
    }

    const url = `https://api.sim.dune.com/beta/svm/transactions/${walletAddress}?limit=100000`;

    const options = {
      method: 'GET',
      headers: {
        'X-Sim-Api-Key': 'sim_fGK2YWtqrWQZwTiRg81PUNGvuMuZ8kKQ',
      },
    };

    const apiResponse = await fetch(url, options);

    if (!apiResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data from external API' }), { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    console.log("calling backend")

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error fetching wallet data:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};