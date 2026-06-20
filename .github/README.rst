ReQuote
=======

A VS Code extension that enforces quote style by content length.

- Single char strings use single quotes -> ``'a'``
- Multi-char strings use double quotes -> ``"hello"``

Supports JavaScript, TypeScript, Python, Rust, and `more <https://github.com/PaulMarisOUMary/ReQuote>`_.

Usage
-----

Quotes are fixed automatically as you type. To toggle manually: ``Alt+Q``.

To disable auto-refactor: ``Ctrl+,`` -> search ``ReQuote: Auto Refactor`` -> uncheck.

Settings
--------

.. list-table::
   :widths: 35 15 50
   :header-rows: 1

   * - Setting
     - Default
     - Description
   * - ``reQuote.autoRefactor``
     - ``true``
     - Flip quotes automatically on keystroke
   * - ``reQuote.languages``
     - see extension
     - Languages where ReQuote is active

License
-------

MIT