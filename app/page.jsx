import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-page";

export const metadata = {
  title: "Home || Job Finder",
  description: "Job Finder is a platform for finding jobs",
};

export default function page() {
  return (
    <Wrapper>
      <Home />
    </Wrapper>
  );
}
