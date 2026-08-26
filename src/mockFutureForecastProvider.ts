import type {
  DomainForecast,
  ForecastTimelineWindow,
  ForecastWindow,
  FutureForecastProvider,
  FutureForecastRequest,
  FutureForecastResult,
  RecommendedAction,
  Stage6ForecastDomain
} from "./futureForecastTypes.ts";
import type { FutureForecastPromptInput } from "./futureForecastTypes.ts";

function labelForDomain(domain: Stage6ForecastDomain): string {
  const labels: Record<Stage6ForecastDomain, string> = {
    career: "事业",
    wealth: "财务",
    relationship: "关系",
    education: "学习",
    migration: "迁移",
    health: "身心状态",
    family: "家庭",
    personal_growth: "个人成长",
    general: "整体"
  };
  return labels[domain];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function domainsFromPrompt(prompt: FutureForecastPromptInput): Stage6ForecastDomain[] {
  const policyLine = prompt.policy_constraints.find((item) => item.startsWith("Supported domains:"));
  const values = policyLine?.replace("Supported domains:", "").split(",").map((item) => item.trim()).filter(Boolean) ?? ["general"];
  return values as Stage6ForecastDomain[];
}

function domainForecast(domain: Stage6ForecastDomain, prompt: FutureForecastPromptInput): DomainForecast {
  const label = labelForDomain(domain);
  const derivativeBasis = prompt.derivative_signals.slice(0, 3).map((signal) => signal.signal);
  const initialBasis = prompt.initial_value_facts.slice(0, 3).map((fact) => fact.fact);
  return {
    domain,
    conclusion: `${label}领域更适合用“机会窗口 + 风险意识”的方式观察，不宜做确定性断言。`,
    forecast: `基于已定 ForecastInput，未来 ${prompt.forecast_horizon} 的${label}主题更可能围绕现有初始条件的延展展开；这不是定盘，也不是保证结果。`,
    confidence: clamp(0.56 + Math.min(0.18, prompt.derivative_signals.length * 0.03 + prompt.initial_value_facts.length * 0.02)),
    derivative_basis: derivativeBasis,
    initial_value_basis: initialBasis,
    time_windows: [`${prompt.current_date} + broad early window`, `${prompt.current_date} + broad later window`],
    caveats: ["This is an offline mock forecast.", "Known facts are not predictions.", "Avoid medical, legal, or financial certainty."]
  };
}

function timeline(prompt: FutureForecastPromptInput, domains: Stage6ForecastDomain[]): ForecastTimelineWindow[] {
  return [
    {
      label: "early_window",
      theme: "梳理方向与资源",
      domains,
      description: `从 ${prompt.current_date} 起的前段窗口更适合做信息整理、方向收敛和低风险试探。`
    },
    {
      label: "later_window",
      theme: "验证选择与调整节奏",
      domains,
      description: "后段窗口更适合复盘实际反馈，避免把单一信号解释成确定结果。"
    }
  ];
}

function windows(domains: Stage6ForecastDomain[]): { opportunities: ForecastWindow[]; risks: ForecastWindow[] } {
  return {
    opportunities: [
      {
        label: "opportunity_window",
        domains,
        description: "当现实资源、偏好方向和外部机会一致时，更适合推进小规模验证。",
        confidence: 0.62
      }
    ],
    risks: [
      {
        label: "risk_window",
        domains,
        description: "当选择过多、节奏过快或压力累积时，误判风险会上升。",
        confidence: 0.58
      }
    ]
  };
}

function actions(domains: Stage6ForecastDomain[]): RecommendedAction[] {
  return [
    {
      action: "把未来行动拆成一个主线和两个可验证假设。",
      priority: "high",
      timeframe: "next_30_to_90_days",
      rationale: `Applies to ${domains.join(", ")} without changing the selected chart.`
    },
    {
      action: "记录实际反馈，作为后续评估材料，而不是回头改定盘。",
      priority: "medium",
      timeframe: "ongoing",
      rationale: "Preserves the boundary between forecast and rectification."
    }
  ];
}

export function createMockFutureForecastProvider(): FutureForecastProvider {
  return {
    provider_id: "mock",
    forecast(request: FutureForecastRequest, prompt: FutureForecastPromptInput): FutureForecastResult {
      const domains = domainsFromPrompt(prompt);
      const forecastWindows = windows(domains);
      return {
        forecast_result_id: `future_forecast_${request.forecast_input.forecast_input_id}`,
        schema_version: "stage6.v1",
        generated_at: `${prompt.current_date}T00:00:00.000Z`,
        current_date: prompt.current_date,
        forecast_horizon: prompt.forecast_horizon,
        executive_summary: "这是离线 mock 未来预测结果：只消费 ForecastInput，不修改定盘、校盘、候选盘排序或 ForecastInput。",
        domain_forecasts: domains.map((domain) => domainForecast(domain, prompt)),
        timeline_windows: request.options?.include_timeline === false ? [] : timeline(prompt, domains),
        opportunity_windows: forecastWindows.opportunities,
        risk_windows: request.options?.include_risk_windows === false ? [] : forecastWindows.risks,
        recommended_actions: request.options?.include_action_plan === false ? [] : actions(domains),
        uncertainty: [
          {
            factor: "forecast_input_uncertainty",
            description: "预测依赖 ForecastInput 的确定性和上下文完整度，不能保证具体事件发生。",
            impact: "medium"
          }
        ],
        known_facts_used: prompt.initial_value_facts,
        derivative_signals_used: prompt.derivative_signals,
        initial_value_adjustments: prompt.initial_value_adjustments,
        policy: {
          provider: "mock",
          ai_used_for_forecast: true,
          ai_used_for_ranking: false,
          ai_used_for_rectification: false,
          ranking_modified: false,
          rectification_modified: false,
          selected_chart_modified: false,
          output_schema_validated: true,
          secrets_included: false
        }
      };
    }
  };
}
