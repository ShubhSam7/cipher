import QuestionList from "@/components/questions/QuestionList";
import { questionFilterSchema } from "@/lib/validation/search";

export default async function Page({ searchParams }: { searchParams: Promise<{ tag?: string | string[]; q?: string | string[]; filter?: string | string[] }> }) {
  const params = await searchParams;
  const tag = typeof params.tag === "string" ? params.tag.trim().toLowerCase() : "";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const parsedFilter = questionFilterSchema.safeParse(params.filter);
  const filter = parsedFilter.success ? parsedFilter.data : "all";
  return <QuestionList key={JSON.stringify([tag, query, filter])} tag={tag} query={query} filter={filter} />;
}
