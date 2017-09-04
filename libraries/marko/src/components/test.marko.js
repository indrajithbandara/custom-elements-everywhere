// Compiled using markoc@4.4.26 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/vdom").t(),
    marko_helpers = require("marko/src/runtime/vdom/helpers"),
    marko_createElement = marko_helpers.e,
    marko_const = marko_helpers.const,
    marko_const_nextId = marko_const("2c669f"),
    marko_node0 = marko_createElement("ce-with-children", null, 1, 0, {
        c: marko_const_nextId()
      })
      .t("LIGHTDOM");

function render(input, out) {
  var data = input;

  out.e("ce-with-properties", {
      bool: true,
      num: "42",
      str: "abc",
      arr: [
          1,
          2,
          3
        ],
      obj: {
          key: "value"
        }
    }, 0);

  out.e("ce-with-properties", {
      bool: true,
      num: "42",
      str: "abc",
      arr: [
          1,
          2,
          3
        ],
      obj: {
          key: "value"
        }
    }, 0);

  out.n(marko_node0);
}

marko_template._ = render;

marko_template.meta = {
    deps: [
      "../../../__shared__/webcomponents/src/ce-with-properties",
      "../../../__shared__/webcomponents/src/ce-with-children"
    ]
  };
