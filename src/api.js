export async function sendRenderRequest(data) {
    const res = await fetch("http://localhost:3000/render", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return res.json();
}
