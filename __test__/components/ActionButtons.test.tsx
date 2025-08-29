// __tests__/components/ActionButtons.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ActionButtons from "@/components/ActionButtons";

describe("ActionButtons", () => {
  it("renderiza los botones y dispara los handlers", () => {
    const onLike = jest.fn();
    const onDislike = jest.fn();

    render(<ActionButtons onLike={onLike} onDislike={onDislike} />);

    const likeBtn = screen.getByTestId("like-btn");
    const dislikeBtn = screen.getByTestId("dislike-btn");

    fireEvent.click(likeBtn);
    fireEvent.click(dislikeBtn);

    expect(onLike).toHaveBeenCalledTimes(1);
    expect(onDislike).toHaveBeenCalledTimes(1);
  });

  it("deshabilita los botones cuando disabled=true y no dispara handlers", () => {
    const onLike = jest.fn();
    const onDislike = jest.fn();

    render(<ActionButtons onLike={onLike} onDislike={onDislike} disabled />);

    const likeBtn = screen.getByTestId("like-btn");
    const dislikeBtn = screen.getByTestId("dislike-btn");
    expect(likeBtn).toBeDisabled();
    expect(dislikeBtn).toBeDisabled();

    fireEvent.click(likeBtn);
    fireEvent.click(dislikeBtn);

    expect(onLike).not.toHaveBeenCalled();
    expect(onDislike).not.toHaveBeenCalled();
  });
});
