import { Extension } from "@tiptap/core";

export const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => {
              const lh = element.style.lineHeight;
              return lh || null;
            },
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },
});
