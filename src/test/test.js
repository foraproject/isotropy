import 'source-map-support/register';
import should from 'should';
import { invoke } from "../isotropy";
import app from "./app";

describe("Isotropy", () => {
  it("Should call default function", async () => {
    const result = await invoke("", app);
    result.should.equal("This is the home page.");
  })

  it("Should call property someProp", async () => {
    const result = await invoke("someProp", app);
    result.should.equal("Hello, world.");
  })

  it("Should call function add(x, y)", async () => {
    const result = await invoke("add(x, y)", app, { x: 10, y: 20 });
    result.should.equal(30);
  })

  it("Should call function with mix of literals and variables add(x, 20)", async () => {
    const result = await invoke("add(x, 20)", app, { x: 10 });
    result.should.equal(30);
  })

  it("Should call async function addAsync(x, y)", async () => {
    const result = await invoke("addAsync(x, y)", app, { x: 10, y: 20 });
    result.should.equal(30);
  })

  it("Should call property inside namespace ns1.ns2.someProp", async () => {
    const result = await invoke("ns1.ns2.someProp", app);
    result.should.equal("A beautiful day.");
  })

  it("Should call function inside namespace ns1.ns2.echo(x, y, z)", async () => {
    const result = await invoke("ns1.ns2.echo(x, y, z)", app, { x: 1, y: true, z: "yes" });
    result.should.deepEqual({ x: 1, y: true, z: 'yes' });
  })
});
