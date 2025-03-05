# Copilot Instructions

## Core Principles

- **Edit In Place**: Make changes directly in the codebase, adding any new files directly.
- **Maintainable and Performant Code:** Write maintainable and performant code suitable for real-time applications.
- **Reusability:** Favor reusing existing logic, updating it to be more generic where appropriate. Encourage modular design and well-documented methods.
- **Modern C# & Data-Oriented:** Prioritize `record` types, `readonly` fields, functional transformations, and the latest C# features.  For example:

  ```csharp
  public record Product(int Id, string Name, decimal Price);

  var discountedProducts = products
      .Where(p => p.Price > 100)
      .Select(p => p with { Price = p.Price * 0.9m });
  ```

- **Testable Code:** Emphasize pure functions with deterministic inputs and outputs. Use property-based testing when applicable.

## Code Style & Conventions

- **Naming Patterns:** Use consistent naming conventions for streaming-related components. For example, prefix third-party provider-related classes with the provider's name (e.g., `TwitchClient`, `YouTubeMessageHandler`).
- **Library Usage:** Prefer official SDKs or libraries provided by .NET Core and Microsoft. Only include third-party libraries when they offer significant advantages.
- **General Standards:**
  - Follow .NET code style conventions.
  - Limit lines to 120 characters.
  - Use `var` where the type is evident.
- **Error Handling:** Use `Result`-like patterns for error handling, encapsulating success and failure states.
- **Logging:** Use `ILogger` for structured, contextual logging. Include relevant details such as user IDs and timestamps.
- **Expression-Bodied Members:** Favor expression-bodied members for simplicity when appropriate.
- **Braces & Async:**
  - Use braces for all control structures, even for single-line blocks, unless using expression-bodied members.
  - Ensure I/O-bound operations are asynchronous (`async/await`).
- **Exceptions:** Log and rethrow unrecoverable exceptions with additional context when necessary.
- **Collection Expressions:** Use C# collection expressions for clarity when creating arrays and collections.
- **File-scoped namespaces:** Use file-scoped namespaces for clarity and simplicity.
