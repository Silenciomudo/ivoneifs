(function (global) {
  "use strict";

  var TYPE_CONFIG = {
    default: {
      title: "Gerador de Prompt",
      label: "Seu tópico ou ideia:",
      placeholder: "Insira seu tópico ou ideia aqui...",
      prefix: "Crie um prompt detalhado e eficaz sobre",
    },
    escrita: {
      title: "Gerador de Prompt de Escrita",
      label: "Sua ideia de escrita:",
      placeholder: "Ex: Um conto sobre uma livraria mágica...",
      prefix: "Escreva um prompt criativo para ficção sobre",
      extras: "Inclua gênero, tom narrativo, público-alvo e elementos de enredo desejados.",
    },
    arte: {
      title: "Gerador de Prompt de Arte de IA",
      label: "Sua ideia de imagem:",
      placeholder: "Ex: Floresta encantada ao amanhecer, cidade cyberpunk na chuva...",
      prefix: "Gere um prompt de arte de IA altamente detalhado para",
      extras: "Inclua estilo artístico, iluminação, composição, paleta de cores e indicadores de qualidade (4K, ultradetalhado).",
    },
    codigo: {
      title: "Gerador de Prompt de Codificação",
      label: "Seu projeto ou ideia:",
      placeholder: "Ex: App de lista de tarefas, jogo simples, dashboard de dados...",
      prefix: "Crie um prompt de desenvolvimento de software para",
      extras: "Especifique stack tecnológica, funcionalidades principais, requisitos técnicos e nível de complexidade.",
    },
    video: {
      title: "Gerador de Prompt de Vídeo",
      label: "Seu conceito de vídeo:",
      placeholder: "Ex: Filmagem de drone de cidade futurista à noite...",
      prefix: "Gere um prompt cinematográfico para vídeo de IA sobre",
      extras: "Inclua tipo de câmera, movimento, duração sugerida, iluminação e estilo visual.",
    },
    musica: {
      title: "Gerador de Prompt de Música",
      label: "Seu conceito musical:",
      placeholder: "Ex: Faixa lo-fi para estudar, balada emocional...",
      prefix: "Crie um prompt musical detalhado para",
      extras: "Inclua gênero, instrumentação, BPM, mood e referências de produção.",
    },
    personagem: {
      title: "Gerador de Prompt de Personagem",
      label: "Descrição do personagem:",
      placeholder: "Ex: Detetive cansado, jovem feiticeira, robô senciente...",
      prefix: "Desenvolva um prompt de personagem fictício para",
      extras: "Inclua aparência, personalidade, motivações, conflitos internos e contexto narrativo.",
    },
    chatgpt: {
      title: "Gerador de Prompt para ChatGPT",
      label: "Seu tópico ou pergunta:",
      placeholder: "Ex: Explique computação quântica para uma criança...",
      prefix: "Formule um prompt otimizado para ChatGPT sobre",
      extras: "Defina papel da IA, formato de resposta, tom e nível de detalhe esperado.",
    },
    claude: {
      title: "Gerador de Prompt para Claude",
      label: "Seu tópico ou pergunta:",
      placeholder: "Ex: Resuma o enredo de Hamlet...",
      prefix: "Crie um prompt estruturado para Claude sobre",
      extras: "Use instruções claras, contexto relevante e especifique o formato da saída.",
    },
    gemini: {
      title: "Gerador de Prompt para Gemini",
      label: "Seu tópico ou pergunta:",
      placeholder: "Ex: Diferenças entre Python e JavaScript...",
      prefix: "Elabore um prompt eficaz para Google Gemini sobre",
      extras: "Inclua objetivo, público-alvo e critérios de qualidade da resposta.",
    },
    midjourney: {
      title: "Gerador de Prompt para Midjourney",
      label: "Sua ideia de imagem:",
      placeholder: "Ex: /imagine dragão steampunk em cidade victoriana...",
      prefix: "Construa um prompt Midjourney otimizado para",
      extras: "Use descritores visuais, estilo (--style), proporção (--ar), iluminação e parâmetros de qualidade.",
    },
    dalle: {
      title: "Gerador de Prompt para DALL·E",
      label: "Sua ideia de imagem:",
      placeholder: "Ex: Poltrona em forma de abacate...",
      prefix: "Crie um prompt descritivo para DALL·E sobre",
      extras: "Use linguagem natural detalhada, estilo artístico e composição clara.",
    },
    "stable-diffusion": {
      title: "Gerador de Prompt para Stable Diffusion",
      label: "Sua ideia de imagem:",
      placeholder: "Ex: Pintura de paisagem ao estilo impressionista...",
      prefix: "Gere um prompt Stable Diffusion detalhado para",
      extras: "Inclua tags de qualidade, estilo, negative prompt sugerido e detalhes técnicos.",
    },
  };

  var ENHANCE_TYPES = {
    improve: {
      label: "Melhorar e Expandir",
      transform: function (text) {
        return (
          "Elabore um prompt completo e bem estruturado com base nesta ideia: \"" +
          text +
          "\". Expanda com contexto, objetivo claro, público-alvo, tom desejado e formato de saída esperado. Torne as instruções específicas e acionáveis para obter os melhores resultados de IA."
        );
      },
    },
    professional: {
      label: "Profissional",
      transform: function (text) {
        return (
          "Transforme a seguinte solicitação em um prompt profissional e formal, adequado para contexto corporativo: \"" +
          text +
          "\". Use linguagem clara, objetiva e estruturada. Inclua tom executivo, entregáveis esperados e critérios de qualidade."
        );
      },
    },
    creative: {
      label: "Criativo",
      transform: function (text) {
        return (
          "Desenvolva um prompt criativo e imaginativo a partir de: \"" +
          text +
          "\". Enriqueça com elementos narrativos, metáforas visuais, atmosfera e detalhes sensoriais que inspirem resultados originais e memoráveis."
        );
      },
    },
    concise: {
      label: "Conciso",
      transform: function (text) {
        return (
          "Condense e refine em um prompt direto e eficiente (máximo 2-3 frases), mantendo clareza e impacto: \"" +
          text +
          "\". Elimine redundâncias e foque no essencial."
        );
      },
    },
    detailed: {
      label: "Detalhado",
      transform: function (text) {
        return (
          "Expanda em um prompt altamente detalhado com especificações técnicas, descritores precisos e parâmetros explícitos: \"" +
          text +
          "\". Adicione detalhes de estilo, composição, tom, formato e indicadores de qualidade relevantes ao contexto."
        );
      },
    },
  };

  var ROLES = {
    assistant: "assistente pessoal eficiente",
    expert: "especialista autoritativo na área",
    teacher: "professor paciente e didático",
    consultant: "consultor estratégico de negócios",
    writer: "escritor criativo experiente",
    analyst: "analista de dados rigoroso",
    researcher: "pesquisador acadêmico metódico",
    creative: "diretor criativo inovador",
  };

  var TONES = {
    professional: "profissional e objetivo",
    friendly: "amigável e acessível",
    formal: "formal e acadêmico",
    casual: "casual e descontraído",
    expert: "técnico e especializado",
    supportive: "apoiador e encorajador",
  };

  function capitalize(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function cleanInput(text) {
    return (text || "").trim().replace(/\s+/g, " ");
  }

  function generatePrompt(idea, typeKey) {
    var cfg = TYPE_CONFIG[typeKey] || TYPE_CONFIG.default;
    var topic = cleanInput(idea);
    if (!topic) return { error: "Por favor, insira um tópico ou ideia para gerar um prompt." };

    var lines = [
      cfg.prefix + " " + topic + ".",
      cfg.extras || "Seja específico sobre objetivo, formato de saída, tom e qualquer restrição importante.",
      "",
      "Estruture a resposta da IA de forma clara, com seções quando apropriado, e priorize utilidade prática e precisão.",
    ];

    return { result: lines.join("\n"), title: cfg.title };
  }

  function enhancePrompt(text, enhanceKey) {
    var input = cleanInput(text);
    if (!input) return { error: "O texto é necessário para aprimorar." };

    var enh = ENHANCE_TYPES[enhanceKey] || ENHANCE_TYPES.improve;
    return { result: enh.transform(input) };
  }

  function generateAgentPrompt(options) {
    var task = cleanInput(options.task);
    if (!task) return { error: "A tarefa principal do agente é obrigatória." };

    var role = ROLES[options.role] || ROLES.assistant;
    var tone = TONES[options.tone] || TONES.professional;
    var context = cleanInput(options.context);

    var parts = [
      "Você é um " + role + " com tom de comunicação " + tone + ".",
      "",
      "Sua tarefa principal: " + task,
    ];

    if (context) {
      parts.push("", "Contexto adicional: " + context);
    }

    parts.push(
      "",
      "Diretrizes de comportamento:",
      "- Mantenha consistência de papel e tom em todas as respostas.",
      "- Forneça respostas estruturadas, práticas e relevantes ao contexto.",
      "- Peça esclarecimentos quando informações essenciais estiverem ausentes.",
      "- Priorize precisão, clareza e utilidade para o usuário."
    );

    return { result: parts.join("\n") };
  }

  function getTypeConfig(typeKey) {
    return TYPE_CONFIG[typeKey] || TYPE_CONFIG.default;
  }

  function listEnhanceTypes() {
    return Object.keys(ENHANCE_TYPES).map(function (k) {
      return { key: k, label: ENHANCE_TYPES[k].label };
    });
  }

  var RANDOM_IDEAS = [
    "Um conto de suspense que começa com: 'A casa velha não estava abandonada, afinal...'",
    "Plano de marketing para tênis sustentáveis visando a Geração Z",
    "Explicação da relatividade com analogias do dia a dia",
    "Receita de smoothie energético para foco e concentração",
    "Calendário de conteúdo semanal para cafeteria independente",
    "Perfil de detetive jovem que resolve crimes via redes sociais",
    "Roteiro de mochilão de 7 dias pelos Alpes Suíços",
    "E-mail pedindo prorrogação de prazo acadêmico",
    "10 perguntas criativas para evento de integração de equipe",
    "Plano de treino para iniciantes focado em cardio e força",
  ];

  var SUGGESTION_TEMPLATES = [
    "Escreva um guia prático sobre {topic} para iniciantes",
    "Crie 5 ideias criativas de conteúdo sobre {topic}",
    "Explique {topic} com exemplos do mundo real",
    "Monte um plano passo a passo para dominar {topic}",
    "Liste erros comuns sobre {topic} e como evitá-los",
  ];

  var HUMANIZE_REPLACEMENTS = [
    [/Portanto,/gi, "Então,"],
    [/Além disso,/gi, "Também,"],
    [/É importante ressaltar que/gi, "Vale destacar que"],
    [/No entanto,/gi, "Mas,"],
    [/Consequentemente,/gi, "Por isso,"],
    [/Em conclusão,/gi, "Pra fechar,"],
    [/utilizar/gi, "usar"],
    [/realizar/gi, "fazer"],
    [/diversos/gi, "vários"],
    [/Additionally,/gi, "Also,"],
    [/Furthermore,/gi, "Plus,"],
    [/Therefore,/gi, "So,"],
    [/However,/gi, "But,"],
    [/In conclusion,/gi, "To wrap up,"],
  ];

  function generateRandomPrompt() {
    var i = Math.floor(Math.random() * RANDOM_IDEAS.length);
    return { result: RANDOM_IDEAS[i] };
  }

  function generateSuggestions(topic) {
    var t = cleanInput(topic);
    if (!t) return { error: "Insira um tópico para obter sugestões." };
    var results = SUGGESTION_TEMPLATES.map(function (tpl, idx) {
      return { index: idx + 1, text: tpl.replace(/\{topic\}/g, t) };
    });
    return { results: results };
  }

  function humanizeText(text) {
    var input = (text || "").trim();
    if (!input) return { error: "Por favor, insira algum texto para humanizar." };

    var out = input;
    HUMANIZE_REPLACEMENTS.forEach(function (pair) {
      out = out.replace(pair[0], pair[1]);
    });

    var sentences = out.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 1) {
      var connectors = ["Na prática,", "Olha só:", "Sabe o que acontece?", "Pra ser direto,"];
      var idx = Math.floor(Math.random() * sentences.length);
      if (sentences[idx].length > 40 && !/^Na prática|^Olha|^Sabe|^Pra ser/.test(sentences[idx])) {
        sentences[idx] = connectors[Math.floor(Math.random() * connectors.length)] + " " + lcfirst(sentences[idx]);
      }
      out = sentences.join(" ");
    }

    out = out.replace(/\s{2,}/g, " ").trim();
    return { result: out };
  }

  function lcfirst(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(function (v) {
      return ("0" + Math.round(v).toString(16)).slice(-2);
    }).join("");
  }

  function describeBrightness(v) {
    if (v < 70) return "escura e moody";
    if (v < 140) return "equilibrada em luminosidade";
    return "clara e arejada";
  }

  function describeOrientation(w, h) {
    var ratio = w / h;
    if (ratio > 1.2) return "orientação paisagem";
    if (ratio < 0.85) return "orientação retrato";
    return "formato quadrado";
  }

  function buildImageAnalysis(meta, analysisType) {
    var colors = meta.colors || [];
    var colorText = colors.length
      ? "Paleta dominante: " + colors.map(function (c) { return c.name + " (" + c.hex + ")"; }).join(", ") + "."
      : "";
    var base =
      "Imagem " + meta.width + "×" + meta.height + "px, " +
      describeOrientation(meta.width, meta.height) + ", atmosfera " +
      describeBrightness(meta.brightness) + ". " + colorText;

    if (analysisType === "describe") {
      return base + "\n\nDescreva cena, objetos principais, texturas, iluminação e clima emocional com base nestas características visuais.";
    }
    if (analysisType === "prompt") {
      return (
        "Prompt de arte IA sugerido:\n" +
        base +
        "\n\nEstilo fotorrealista, composição " + (meta.width > meta.height ? "ampla" : "vertical") +
        ", iluminação cinematográfica, altamente detalhado, 8K, profundidade de campo suave."
      );
    }
    if (analysisType === "detailed") {
      return (
        "Análise visual:\n" +
        "- Dimensões: " + meta.width + "×" + meta.height + "\n" +
        "- Orientação: " + describeOrientation(meta.width, meta.height) + "\n" +
        "- Luminosidade média: " + Math.round(meta.brightness) + "/255\n" +
        "- " + colorText + "\n" +
        "- Sugestão: enfatizar contraste, textura e ponto focal central."
      );
    }
    return (
      "História criativa:\n" +
      "Num instante " + describeBrightness(meta.brightness).split(" ")[0] + ", " +
      "algo nesta cena " + describeOrientation(meta.width, meta.height) +
      " guarda um segredo. " + colorText +
      " Deixe a imaginação completar personagens, conflito e desfecho."
    );
  }

  function extractImageMetaFromCanvas(ctx, width, height) {
    var data = ctx.getImageData(0, 0, width, height).data;
    var step = Math.max(4, Math.floor(data.length / 4 / 800));
    var r = 0, g = 0, b = 0, count = 0;
    var buckets = {};

    for (var i = 0; i < data.length; i += step * 4) {
      var pr = data[i], pg = data[i + 1], pb = data[i + 2];
      r += pr; g += pg; b += pb; count++;
      var key = Math.round(pr / 32) + "-" + Math.round(pg / 32) + "-" + Math.round(pb / 32);
      buckets[key] = (buckets[key] || 0) + 1;
    }

    r /= count; g /= count; b /= count;
    var brightness = (r + g + b) / 3;

    var top = Object.keys(buckets).sort(function (a, b) { return buckets[b] - buckets[a]; }).slice(0, 3);
    var colors = top.map(function (k) {
      var p = k.split("-").map(Number);
      var cr = p[0] * 32, cg = p[1] * 32, cb = p[2] * 32;
      return { hex: rgbToHex(cr, cg, cb), name: colorName(cr, cg, cb) };
    });

    return { width: width, height: height, brightness: brightness, colors: colors };
  }

  function colorName(r, g, b) {
    if (r > 200 && g > 200 && b > 200) return "branco suave";
    if (r < 40 && g < 40 && b < 40) return "preto profundo";
    if (r > g && r > b) return "tom quente avermelhado";
    if (g > r && g > b) return "tom verde natural";
    if (b > r && b > g) return "tom azul frio";
    if (r > 180 && g > 140 && b < 80) return "dourado";
    return "tom neutro";
  }

  global.PromptEngine = {
    generatePrompt: generatePrompt,
    enhancePrompt: enhancePrompt,
    generateAgentPrompt: generateAgentPrompt,
    generateRandomPrompt: generateRandomPrompt,
    generateSuggestions: generateSuggestions,
    humanizeText: humanizeText,
    buildImageAnalysis: buildImageAnalysis,
    extractImageMetaFromCanvas: extractImageMetaFromCanvas,
    getTypeConfig: getTypeConfig,
    listEnhanceTypes: listEnhanceTypes,
    TYPE_CONFIG: TYPE_CONFIG,
  };
})(window);
