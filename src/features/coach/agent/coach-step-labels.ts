const WIDGET_STEP_LABELS: Record<string, string> = {
  experience: "Setting up your experience level",
  muscle_focus: "Choosing muscle focus options",
  equipment_access: "Preparing equipment choices",
  choice_chips: "Preparing quick choices",
  multi_select_chips: "Preparing options for you",
  plan_created: "Building your plan preview",
  exercise_swap: "Preparing your exercise swap",
  session_mutation: "Adjusting today's session",
  safety_notice: "Preparing a safety note",
  gentle_routine: "Designing a gentle routine",
  urgent_care: "Preparing guidance",
  exercise_options: "Finding exercise alternatives",
};

export function coachStepLabelForTool(
  toolName: string,
  input: unknown,
): string {
  switch (toolName) {
    case "search_exercises":
      return "Searching the exercise library";
    case "update_plan":
      return "Updating your plan";
    case "show_widget": {
      const widget =
        input !== null &&
        typeof input === "object" &&
        "widget" in input &&
        (input as { widget: unknown }).widget !== null &&
        typeof (input as { widget: unknown }).widget === "object"
          ? (input as { widget: { type?: string } }).widget
          : null;
      const type = widget?.type;
      if (type && WIDGET_STEP_LABELS[type]) {
        return WIDGET_STEP_LABELS[type];
      }
      return "Preparing something for you";
    }
    default:
      return "Working on your request";
  }
}
